export const onAddressAccess = (
	cache_table: CacheTable,
	binary_address: string,
	current_time: number,
	cache_line_length_bytes: number,
	amount_cache_sets: number,
	cache_lines_per_cache_set: number,
	replacement_strategy: string
) => {
	const logs = [];

	const offset_bitlen = Math.log2(cache_line_length_bytes) | 0;
	const index_bitlen = Math.log2(amount_cache_sets) | 0;

	const offset_bits = binary_address.slice(-offset_bitlen);
	const index_bits = binary_address.slice(-(offset_bitlen + index_bitlen), -offset_bitlen);
	const tag_bits = binary_address.slice(0, -(offset_bitlen + index_bitlen));

	logs.push(`[Address Access] Address: ${binary_address} | Tag: ${tag_bits} | Index: ${index_bits} | Offset: ${offset_bits}`);

	if (index_bits in cache_table) {
		const tags = cache_table[index_bits];
		let hit = false;

		tags.forEach((entry, idx) => {
			if (entry.bits === tag_bits) {
				logs.push(`[Cache Hit] Entry found at index ${idx} in set ${index_bits}.`);
				entry.lastAccessed = current_time;
				entry.accessCount += 1;
				hit = true;
			}
		});

		if (!hit) {
			logs.push(`[Cache Miss] Tag ${tag_bits} not found in set ${index_bits}.`);

			if (tags.length < cache_lines_per_cache_set) {
				tags.push({
					bits: tag_bits,
					lastAccessed: current_time,
					accessCount: 0,
					createdAt: current_time
				});
				logs.push(`[Cache Allocation] Added tag ${tag_bits} to set ${index_bits}.`);
			} else {
				let oldest_entry_index;
				logs.push(`[Cache Allocation] Set ${index_bits} is full`);

				if (replacement_strategy === "LRU") {
					oldest_entry_index = tags.reduce((oldest, _, i, arr) =>
						arr[i].lastAccessed < arr[oldest].lastAccessed ? i : oldest, 0);
					logs.push(`[Replacement Strategy: LRU] Replacing entry at index ${oldest_entry_index}.`);
				} else if (replacement_strategy === "LFU") {
					oldest_entry_index = tags.reduce((oldest, _, i, arr) =>
						arr[i].accessCount < arr[oldest].accessCount ? i : oldest, 0);
					logs.push(`[Replacement Strategy: LFU] Replacing entry at index ${oldest_entry_index}.`);
				} else if (replacement_strategy === "FIFO") {
					oldest_entry_index = tags.reduce((oldest, _, i, arr) =>
						arr[i].createdAt < arr[oldest].createdAt ? i : oldest, 0);
					logs.push(`[Replacement Strategy: FIFO] Replacing entry at index ${oldest_entry_index}.`);
				} else {
					throw new Error("Unsupported replacement strategy");
				}

				tags[oldest_entry_index] = {
					bits: tag_bits,
					lastAccessed: current_time,
					accessCount: 0,
					createdAt: current_time
				};
			}
		}
	} else {
		logs.push(`[Cache Miss] Index ${index_bits} not found. Creating new set and adding tag ${tag_bits}.`);
		cache_table[index_bits] = [{
			bits: tag_bits,
			lastAccessed: current_time,
			accessCount: 0,
			createdAt: current_time
		}];
	}

	return { cache_table, logs };
};

export interface CacheEntry {
	bits: string;
	lastAccessed: number;
	accessCount: number;
	createdAt: number;
}

export type CacheTable = { [index: string]: CacheEntry[] };

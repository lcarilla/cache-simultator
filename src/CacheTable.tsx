import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table"
import {FC} from "react";
import {CacheTable as CacheTableT} from "@/lib/cache.ts";

export type CacheTableProps = {
	cacheTable: CacheTableT,
	amountTagsPerSet: number,
	amountSets: number,
	currentTime: number,
}

export const CacheTable: FC<CacheTableProps> = ({cacheTable, amountTagsPerSet, amountSets, currentTime}) => {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Set</TableHead>
					{[...Array(amountTagsPerSet).keys()].map(
						tagIndex => <TableCell key={tagIndex}>Tag {tagIndex}</TableCell>
					)}
				</TableRow>
			</TableHeader>
			<TableBody>
				{[...Array(amountSets).keys()].map(
					(decimalSet) => {
						const cacheSet = Number(decimalSet).toString(2).padStart((amountSets - 1).toString(2).length, "0")

						const cacheEntries = cacheTable[cacheSet];

						return <TableRow key={cacheSet}>
							<TableCell key={cacheSet}>{decimalSet}</TableCell>
							{cacheEntries?.map(entry => <TableCell key={entry.bits}>
								<p>{entry.bits}</p>
								<p className="text-xs">Age: {currentTime - entry.createdAt}</p>
								<p className="text-xs">Last Accessed: {entry.lastAccessed}</p>
								<p className="text-xs">#Accesses: {entry.accessCount}</p>
							</TableCell>)}
						</TableRow>
					}
				)}
			</TableBody>
		</Table>
	)
}
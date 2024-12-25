import {ChangeEventHandler, ComponentProps, FC, FormEventHandler, MouseEventHandler, useCallback, useMemo, useState} from "react";
import {CacheTable} from "@/CacheTable.tsx";
import {CacheTable as CacheTableT, onAddressAccess} from "@/lib/cache.ts";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import Header from "@/components/header.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select"
import {Alert, AlertDescription,} from "@/components/ui/alert"

function App() {
	const [cacheStack, setCacheStack] = useState<CacheTableT[]>([{}])

	const [simulationStarted, setSimulationStarted] = useState(false);

	const [replacementStrategy, setReplacementStrategy] = useState<undefined | string>(undefined);

	const [cacheLineSize, setCacheLineSize] = useState(0);
	const [cacheSetAmount, setCacheSetAmount] = useState(0);
	const [associativity, setAssociativity] = useState(0);

	const [log, setLog] = useState<string[] | undefined>()

	const [currentTime, setCurrentTime] = useState(0);

	const onSubmit: FormEventHandler<HTMLFormElement> = useCallback((e) => {
		e.preventDefault();
		const data = new FormData(e.currentTarget);
		setCacheLineSize(Number(data.get("cacheLineSize")))
		setCacheSetAmount(Number(data.get("cacheSetAmount")))
		setAssociativity(Number(data.get("associativity")))
		setReplacementStrategy(String(data.get("replacementStrategy")))
		setSimulationStarted(true);
	}, [])

	const onAddress: FormEventHandler<HTMLFormElement> = useCallback((e) => {
		e.preventDefault();
		const data = new FormData(e.currentTarget);
		const address = String(data.get("address"))
		const {cache_table, logs} = onAddressAccess(
			JSON.parse(JSON.stringify(cacheStack.at(-1) ?? {})),
			address,
			currentTime,
			cacheLineSize,
			cacheSetAmount,
			associativity,
			replacementStrategy ?? "LRU"
		)
		setCacheStack([...cacheStack, cache_table])
		setCurrentTime(currentTime + 1)
		setLog(logs)
	}, [cacheStack, currentTime, cacheLineSize, cacheSetAmount, associativity, replacementStrategy])

	const [value, setValue] = useState('');

	const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
		let inputValue = e.target.value;

		inputValue = inputValue.padStart(32, '0');

		setValue(inputValue);
	};

	const popStack: MouseEventHandler<HTMLButtonElement> = (e) => {
		e.preventDefault();
		e.stopPropagation();
		const cp = [...cacheStack];
		cp.pop();

		setCacheStack(cp)
		setCurrentTime(ct => ct - 1)
	}

	const latestCache = useMemo(() => cacheStack.at(-1) ?? {}, [cacheStack])

	return (
		<div>
			<Header title="Cache simulator" repoUrl={"h"}></Header>

			{!simulationStarted && <form onSubmit={onSubmit} className="mx-12">
				<div className="grid grid-cols-2 gap-2">
					<InputWithText text="Cachezeilengröße" name="cacheLineSize" type="number" required={true}/>
					<InputWithText text="Anzahl an Zeilenmengen / Cache-Sets" name="cacheSetAmount" type="number" required={true}/>
					<InputWithText text="Assoziativität / Cachezeilen pro Set" name="associativity" type="number" required={true}/>
					<p>Replacement Strategy</p>
					<Select required={true} name="replacementStrategy">
						<SelectTrigger>
							<SelectValue placeholder="Replacement Strategy"/>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="LRU">LRU</SelectItem>
							<SelectItem value="LFU">LFU</SelectItem>
							<SelectItem value="FIFO">FIFO</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className="w-full flex justify-center my-10">
					<Button type="submit">Start Simulation</Button>
				</div>
			</form>}
			{simulationStarted && <form onSubmit={onAddress} className="mx-12">
				<div className="grid grid-cols-2 gap-2">
					<InputWithText text="Address (Binary format)" name="address" onBlur={handleChange} onChange={(e) => setValue(e.currentTarget.value)}
								   value={value}/>
				</div>
				<div className="w-full flex justify-around my-10">
					<Button onClick={popStack}>Revert last access</Button>
					<Button type="submit">Simulate Memory Access</Button>
				</div>
			</form>}
			<div className="my-5 px-10">
				{log && <Alert>
					<AlertDescription>
						{log.map(l => <p>{l}</p>)}
					</AlertDescription>
				</Alert>}
			</div>
			{simulationStarted &&
				<CacheTable amountTagsPerSet={associativity} cacheTable={latestCache} amountSets={cacheSetAmount}
							currentTime={currentTime}></CacheTable>
			}
		</div>
	)
}

type InputWithTextProps = {
	text: string,
	name: string
}
const InputWithText: FC<InputWithTextProps & ComponentProps<"input">> = ({text, name, ...props}) => {
	return <>
		<p>{text}</p>
		<Input name={name} {...props}/>
	</>
}
export default App

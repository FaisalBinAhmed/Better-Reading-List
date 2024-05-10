import { render } from "preact";
import { useState, useEffect } from "preact/hooks";

type StorageKey = "autoRead";

export async function getOneStorageItem(itemKey: StorageKey) {
	try {
		return chrome.storage.sync.get(itemKey);
	} catch (error) {}
}
//TODO: make the return value typesafe. DONE

export async function setOneStorageObject(
	itemKey: StorageKey,
	value: boolean | number | string
) {
	try {
		chrome.storage.sync.set({ [itemKey]: value });
	} catch (error) {}
}

function Settings() {
	const [autoRead, setAutoRead] = useState(false);

	useEffect(() => {
		restoreSettings();
	}, []);

	async function restoreSettings() {
		const value = await getOneStorageItem("autoRead");
		value && setAutoRead(value.autoRead);
	}

	function toggleAutoRead() {
		const newValue = !autoRead;
		setAutoRead(newValue);
		setOneStorageObject("autoRead", newValue);
	}

	function saveSettings() {
		chrome.storage.sync.set({ autoRead });
	}

	return (
		<div className="flex flex-col gap-4 m-4 items-start">
			<div className="text-xl font-bold">Settings</div>
			<div className="text-lg items-center flex flex-row gap-1">
				<input
					type="checkbox"
					className="w-6 h-6 text-blue-600 rounded focus:ring-blue-600 ring-offset-gray-800 focus:ring-2 bg-gray-700 border-gray-600"
					checked={autoRead}
					onClick={toggleAutoRead}
				/>
				<label>Automatically mark item as read when opened.</label>
			</div>
			<div
				className="cursor-pointer bg-black text-lg rounded p-2"
				onClick={saveSettings}>
				Save settings
			</div>
			<div className="text-xl font-bold ">About</div>
			<p className="text-base">
				Website:{" "}
				<a href="https://failab.eu" className="text-blue-400" target="_blank">
					Failab
				</a>
			</p>
			<p className="text-base">
				Donate:{" "}
				<a
					href="https://www.buymeacoffee.com/faisalbin"
					className="text-blue-400"
					target="_blank">
					Buy Me A Coffee
				</a>
			</p>
		</div>
	);
}

render(<Settings />, document.getElementById("settings")!);

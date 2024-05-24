type StorageKey = "autoRead";
export async function getOneStorageItem(itemKey: StorageKey) {
	try {
		return chrome.storage.sync.get(itemKey);
	} catch (error) {}
}

export async function setOneStorageObject(
	itemKey: StorageKey,
	value: boolean | number | string
) {
	try {
		chrome.storage.sync.set({ [itemKey]: value });
	} catch (error) {}
}

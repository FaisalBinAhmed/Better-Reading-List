import { useEffect, useState } from "preact/hooks";

type ReadingListItem = {
	title?: string;
	url?: string;
	hasBeenRead?: boolean;
};

function getUrlDomain(url?: string) {
	if (!url) {
		return "";
	}
	const urlObj = new URL(url);
	return urlObj.hostname;
}

const ReadingList = () => {
	const [listItems, setListItems] = useState<ReadingListItem[]>([]);
	const [itemType, setItemType] = useState<"all" | "unread">("all");

	useEffect(() => {
		fetchListItems();
	}, []);

	async function fetchListItems() {
		// @ts-ignore
		const items = (await chrome.readingList.query({})) as ReadingListItem[]; //until the API is available in the typedef
		setItemType("all");
		setListItems(items);
	}

	async function fetchUnreadItems() {
		// @ts-ignore
		const items = (await chrome.readingList.query({
			hasBeenRead: false
		})) as ReadingListItem[];
		setItemType("unread");
		setListItems(items);
	}

	function getFaviconUrl(link?: string) {
		// return `https://www.google.com/s2/favicons?domain=${url}&sz=128`; // this will throw third party cookies warning

		if (!link) {
			return;
		}

		const url = new URL(chrome.runtime.getURL("/_favicon/"));
		url.searchParams.set("pageUrl", link);
		url.searchParams.set("size", "128");
		return url.toString();
	}

	// function openUrl(url?: string) {
	// 	window.open(url, "_blank");
	// }

	function refreshListItems() {
		if (itemType === "all") {
			fetchListItems();
		} else {
			fetchUnreadItems();
		}
	}

	async function deleteItem(url?: string) {
		if (!url) {
			return;
		}
		// @ts-ignore
		await chrome.readingList.removeEntry({ url });

		// todo: update the listItems state to reflect the change instead of refetching
		refreshListItems();
	}

	async function addCurrentTab() {
		const currentTab = await chrome.tabs.query({
			active: true
		});

		// @ts-ignore
		await chrome.readingList.addEntry({
			title: currentTab[0].title,
			url: currentTab[0].url,
			hasBeenRead: false
		});

		refreshListItems();
	}

	async function changeReadStatus(url?: string, hasBeenRead?: boolean) {
		if (!url) {
			return;
		}

		// @ts-ignore
		await chrome.readingList.updateEntry({
			url,
			hasBeenRead
		});
		//temp todo:
		refreshListItems();
	}

	return (
		<div className="w-[320px] flex-col overflow-scroll max-h-[500px] p-2">
			<div className="">Better Reading List</div>
			<div
				onClick={addCurrentTab}
				className="text-lg bg-black p-4 my-2 text-center rounded cursor-pointer hover:text-green-400">
				Add current tab to list
			</div>
			<div className="flex flex-row items-center justify-between gap-2 my-2">
				<p>Items: {listItems.length}</p>
				<div className="flex bg-black rounded flex-row p-2 gap-2">
					<button
						onClick={fetchListItems}
						className={itemType === "all" ? "text-white" : "text-neutral-400"}>
						All
					</button>
					<button
						onClick={fetchUnreadItems}
						className={
							itemType === "unread" ? "text-white" : "text-neutral-400"
						}>
						Unread
					</button>
				</div>
			</div>
			<div className="flex flex-col gap-2">
				{listItems.map((item) => (
					<a
						// onClick={() => openUrl(item.url)}
						key={item.url}
						href={item.url}
						title={item.title}
						target={"_blank"}
						className="flex flex-row bg-black cursor-pointer  p-2 gap-2 hover:bg-[#252525] rounded border border-white/[0.1]">
						<div className="items-start flex">
							<img
								src={getFaviconUrl(item.url)}
								alt="favicon"
								className="w-8 h-8 bg-[#252525] p-2 rounded"
							/>
						</div>
						<div className="flex-1 flex items-start flex-col gap-1 ">
							<div className="line-clamp-2">{item.title}</div>
							<div className="text-neutral-400 text-xs">
								{getUrlDomain(item.url)}
							</div>
						</div>
						<div className="flex flex-row gap-2 items-start">
							{item.hasBeenRead ? (
								<img
									src="/icons/envelope-open.svg"
									alt="unread"
									title={"Mark as unread"}
									className="w-4 h-4"
									onClick={(e) => {
										e.stopPropagation();
										changeReadStatus(item.url, false);
									}}
								/>
							) : (
								<img
									src="/icons/envelope.svg"
									alt="read"
									title={"Mark as read"}
									className="w-4 h-4"
									onClick={(e) => {
										e.stopPropagation();
										changeReadStatus(item.url, true);
									}}
								/>
							)}

							<img
								src="/icons/trash.svg"
								alt="delete"
								title={"Delete"}
								className="w-4 h-4"
								onClick={(e) => {
									e.stopPropagation();
									deleteItem(item.url);
								}}
							/>
						</div>
					</a>
				))}
			</div>
		</div>
	);
};

export default ReadingList;

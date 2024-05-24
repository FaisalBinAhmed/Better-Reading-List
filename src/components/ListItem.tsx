import { getOneStorageItem } from "../helper";
import { ReadingListItem } from "./ReadingList";

function getUrlDomain(url?: string) {
	if (!url) {
		return "";
	}
	const urlObj = new URL(url);
	return urlObj.hostname;
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

const ListItem = ({
	title,
	url,
	hasBeenRead,
	refreshHandler
}: ReadingListItem & { refreshHandler: () => void }) => {
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
		refreshHandler();
	}

	async function deleteItem(url?: string) {
		if (!url) {
			return;
		}
		// @ts-ignore
		await chrome.readingList.removeEntry({ url });

		// todo: update the listItems state to reflect the change instead of refetching
		refreshHandler();
	}

	function openUrl(url?: string) {
		markReadIfNeeded(url);
		window.open(url, "_blank");
	}

	async function markReadIfNeeded(url?: string) {
		const value = await getOneStorageItem("autoRead");

		if (value?.autoRead) {
			changeReadStatus(url, true);
		}
	}

	return (
		<div
			onClick={() => openUrl(url)}
			href={url}
			title={title}
			target={"_blank"}
			className="flex flex-row bg-[#121212] cursor-pointer  p-3 gap-3 hover:bg-[#252525] rounded  border-white/[0.1]">
			<div className="items-start flex">
				<img
					src={getFaviconUrl(url)}
					alt="favicon"
					className="w-8 h-8 bg-[#252525] p-2 rounded"
				/>
			</div>
			<div className="flex-1 flex items-start flex-col gap-1 ">
				<div className="line-clamp-2">{title}</div>
				<div className="text-neutral-400 text-xs">{getUrlDomain(url)}</div>
			</div>
			<div className="flex flex-row gap-2 items-start">
				{hasBeenRead ? (
					<img
						src="/icons/envelope-open.svg"
						alt="unread"
						title={"Mark as unread"}
						className="w-4 h-4"
						onClick={(e) => {
							e.stopPropagation();
							changeReadStatus(url, false);
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
							changeReadStatus(url, true);
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
						deleteItem(url);
					}}
				/>
			</div>
		</div>
	);
};

export default ListItem;

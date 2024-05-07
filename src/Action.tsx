import { render } from "preact";
import ReadingList from "./components/ReadingList";

const ActionPage = () => {
	return <ReadingList />;
};

render(<ActionPage />, document.getElementById("action")!);

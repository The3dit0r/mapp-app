import { createContext } from "react";
import Queue from "./_queueSystem";
import { generateData } from "../utilityFunction";

const queue = generateData(53);

const QueueContext = createContext(new Queue({ items: queue, loopMode: 1 }));
export default QueueContext;

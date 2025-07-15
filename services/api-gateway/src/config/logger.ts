import {config} from "./index";
import {getLogger} from "@bank/logger";

const logger = getLogger("@bank/api-gateway", config.LOG_LEVEL);
export default logger;

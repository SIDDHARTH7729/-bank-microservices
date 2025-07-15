import {config} from "./index";
import {getLogger} from "@bank/logger";

const logger = getLogger("@bank/auth-service", config.LOG_LEVEL);

export default logger;
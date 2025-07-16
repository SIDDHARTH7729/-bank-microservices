import { config } from ".";
import { getLogger } from "@bank/logger";


const logger = getLogger("@bank/account-service", config.LOG_LEVEL);
export default logger;

import { Router } from "express";
import { AccountController } from "../controllers/account.controllers";
import { accountService} from "../services/account.services";

const accountRouter = Router();
const accountController = new AccountController(accountService);

accountRouter.post("/",
              accountController.create.bind(accountController));

accountRouter.get("/",
              accountController.list.bind(accountController));

accountRouter.get("/:accountNumber",
              accountController.get.bind(accountController));
accountRouter.delete("/:accountNumber",
              accountController.delete.bind(accountController));
accountRouter.post("/internal/transaction",
              accountController.internalTransaction.bind(accountController));

export default accountRouter;

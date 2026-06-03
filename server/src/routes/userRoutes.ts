import { Router } from "express";

import { getUsers, getUser, postUser, updateUser } from "../controllers/userController";

const router = Router();

router.get("/", getUsers);
router.get("/:cognitoId", getUser);
router.post("/", postUser);
router.patch("/:cognitoId", updateUser);

export default router;
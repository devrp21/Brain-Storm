import express from "express";
import { createPost } from "../controller/feed.js";

const router=express.Router();

router.post('/post',createPost);


export default router;
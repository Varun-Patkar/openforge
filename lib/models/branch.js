import mongoose from "mongoose";

const BranchSchema = new mongoose.Schema({
	name: { type: String, required: true },
	botId: { type: mongoose.Schema.Types.ObjectId, ref: "Bot", required: true },
	isDefault: { type: Boolean, default: false },
	sourceBranchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
	sourceCommitId: { type: mongoose.Schema.Types.ObjectId, ref: "Commit" },
	latestCommitId: { type: mongoose.Schema.Types.ObjectId, ref: "Commit" },
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Branch || mongoose.model("Branch", BranchSchema);

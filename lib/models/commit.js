import mongoose from "mongoose";

const CommitSchema = new mongoose.Schema({
	botId: { type: mongoose.Schema.Types.ObjectId, ref: "Bot", required: true },
	branchId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Branch",
		required: true,
	},
	message: { type: String, required: true },
	parentCommitId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Commit",
		default: null,
	},
	// Store the complete model state for the first commit
	// For subsequent commits, store only the diff
	isInitialCommit: { type: Boolean, default: false },
	modelState: { type: Object }, // Complete model for initial commit
	modelDiff: { type: Object }, // JSON patch format diffs for subsequent commits
	author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Commit || mongoose.model("Commit", CommitSchema);

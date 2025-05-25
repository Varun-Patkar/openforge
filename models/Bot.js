import mongoose from "mongoose";

const ExampleSchema = new mongoose.Schema({
	input: {
		type: String,
		required: true,
	},
	expectedOutput: {
		type: String,
		required: true,
	},
});

const BotSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Please provide a name for this bot."],
		maxlength: [50, "Name cannot be more than 50 characters"],
	},
	description: {
		type: String,
		maxlength: [200, "Description cannot be more than 200 characters"],
	},
	visibility: {
		type: String,
		enum: ["public", "private"],
		default: "private",
	},
	systemPrompt: {
		type: String,
	},
	examples: [ExampleSchema],
	userId: {
		type: mongoose.Schema.Types.ObjectId, // This will store the MongoDB _id of the user
		ref: "User", // Assuming your NextAuth user collection is named 'users'
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
});

// Middleware to update `updatedAt` field
BotSchema.pre("save", function (next) {
	this.updatedAt = Date.now();
	next();
});

BotSchema.pre("findOneAndUpdate", function (next) {
	this.set({ updatedAt: Date.now() });
	next();
});

// Ensure the model is not recompiled if it already exists
export default mongoose.models.Bot || mongoose.model("Bot", BotSchema);

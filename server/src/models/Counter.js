import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 1000 },
});

export const getNextSequence = async (sequenceName) => {
  const existing = await Counter.findById(sequenceName);
  if (!existing) {
    await Counter.create({ _id: sequenceName, seq: 1000 });
  }

  const counter = await Counter.findByIdAndUpdate(
    sequenceName,
    { $inc: { seq: 1 } },
    { returnDocument: "after" }
  );
  return counter.seq;
};

const Counter = mongoose.model("Counter", counterSchema);

export default Counter;

import mongoose, { Document, Schema } from 'mongoose';

const UserSchema: Schema = new Schema({
  discord_id: {type: String, required: true}
});

export interface IUser extends Document {
  _id: string
  discord_id: string
}
export const User = mongoose.model<IUser>('User', UserSchema);

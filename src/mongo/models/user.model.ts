import mongoose, { Document, Schema } from 'mongoose';

const UserSchema: Schema = new Schema({
  discord_id: { type: String, required: true, unique : true },
  balance: { type: Number, required: true, default: 500 }
});

UserSchema.methods.matches = function(user: IUser): boolean { return this.discord_id === user.discord_id; };

export interface IUser extends Document {
  _id: string
  discord_id: string
  balance: number
  matches(user: IUser): boolean
}
export const User = mongoose.model<IUser>('User', UserSchema);

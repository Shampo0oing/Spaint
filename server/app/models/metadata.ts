import { Document, model, Schema } from 'mongoose';

const metadata = new Schema({
    name: { type: String, required: true },
    tags: { type: Array, required: true },
});

export interface IMetadata extends Document {
    name: string;
    tags: string[];
}

export default model<IMetadata>('Metadata', metadata);

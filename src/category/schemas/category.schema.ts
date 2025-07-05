import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'category' })
export class Category {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ default: true })
  active: boolean;
}

export type CategoryDocument = Category & Document;
export const CategorySchema = SchemaFactory.createForClass(Category);

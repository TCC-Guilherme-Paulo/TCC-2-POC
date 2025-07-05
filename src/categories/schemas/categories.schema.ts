import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'category' })
export class Categories {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ default: true })
  active: boolean;
}

export type CategoriesDocument = Categories & Document;
export const CategoriesSchema = SchemaFactory.createForClass(Categories);

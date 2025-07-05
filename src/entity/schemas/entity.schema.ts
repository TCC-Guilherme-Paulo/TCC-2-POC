import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: { createdAt: 'registerDate', updatedAt: 'updatedAt' }, collection: 'entity' })
export class Entity {
  @Prop({ required: true })
  name: string;

  @Prop()
  deviceId?: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true, unique: true, index: true })
  cnpj: string;

  @Prop()
  photo?: string;

  @Prop()
  notificationToken?: string;

  /** Endereço estruturado */
  @Prop({
    type: {
      cep: { type: String },
      number: { type: Number },
      city: { type: String },
      state: { type: String },
      complement: { type: String },
    },
  })
  address?: {
    cep?: string;
    number?: number;
    city?: string;
    state?: string;
    complement?: string;
  };

  /** Localização geográfica (GeoJSON Point) */
  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      index: '2dsphere',
    },
  })
  location?: { type: 'Point'; coordinates: number[] };

  @Prop()
  phone?: string;

  /** Data de cadastro — repetida para compatibilidade com o modelo anterior */
  @Prop({ default: Date.now })
  registerDate?: Date;

  @Prop({ default: true })
  active: boolean;

  @Prop({ default: '-' })
  biography?: string;
}

export type EntityDocument = Entity & Document;

export const EntitySchema = SchemaFactory.createForClass(Entity);

EntitySchema.set('toObject', { virtuals: true });
EntitySchema.set('toJSON', { virtuals: true });

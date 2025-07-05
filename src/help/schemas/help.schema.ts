import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Categories } from 'src/categories/schemas/categories.schema';
import { User } from 'src/user/schemas/user.schema';
import { HelpStatus } from '../enums/HelpStatus.enum';
import { calculateDistance, getDistance } from 'src/utils/geolocation/calculateDistance';

@Schema({ timestamps: { createdAt: 'creationDate' }, collection: 'userHelp' })
export class Help {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, maxlength: 300 })
  description: string;

  @Prop({ type: String, enum: Object.values(HelpStatus), default: HelpStatus.WAITING })
  status: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: User.name }] })
  possibleHelpers: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Entity' }] })
  possibleEntities: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: Categories.name }] })
  categoryId: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  ownerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name })
  helperId?: Types.ObjectId;

  @Prop({ type: Date })
  finishedDate?: Date;

  @Prop({ default: true })
  active: boolean;

  @Prop({ type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: { type: [Number], index: '2dsphere' } })
  location?: { type: string; coordinates: number[] };

  @Prop({ type: Number, default: 1, unique: true })
  index: number;

  distances?: object
}

export const HelpSchema = SchemaFactory.createForClass(Help);
export type HelpDocument = Help & Document;

HelpSchema.virtual('categories', {
  ref: Categories.name,
  localField: 'categoryId',
  foreignField: '_id',
});

HelpSchema.virtual('user', {
  ref: User.name,
  localField: 'ownerId',
  foreignField: '_id',
  justOne: true,
});

HelpSchema.virtual('distances')
  .set(function ({ userCoords, coords }: { userCoords: number[]; coords: number[] }) {
    const userLocation = { longitude: userCoords[0], latitude: userCoords[1] };
    const helpLocation = { longitude: coords[0], latitude: coords[1] };

    const calculatedDistance = calculateDistance(userLocation, helpLocation);
    const formattedDistance = getDistance(userLocation, helpLocation);

    (this as any)._distanceValue = calculatedDistance;
    (this as any)._distance = formattedDistance;
  });

HelpSchema.virtual('distanceValue')
  .get(function () {
    return (this as any)._distanceValue || null;
  });

HelpSchema.virtual('distance')
  .get(function () {
    return (this as any)._distance || null;
  });

HelpSchema.virtual('type')
  .get(function () {
    return 'help';
  });

HelpSchema.set('toObject', { virtuals: true });
HelpSchema.set('toJSON', { virtuals: true });
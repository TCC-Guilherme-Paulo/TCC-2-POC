import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { HelpStatusEnum } from 'src/utils/enums/helpStatusEnum';
import { calculateDistance, getDistance } from 'src/utils/geolocation/calculateDistance';

@Schema({ collection: 'helpOffer', timestamps: true })
export class HelpOffer extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, maxlength: 300 })
  description: string;

  @Prop({ 
    type: String, 
    enum: Object.values(HelpStatusEnum), 
    default: HelpStatusEnum.WAITING 
  })
  status: HelpStatusEnum;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  possibleHelpedUsers: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Entity' }] })
  possibleEntities: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Category' }] })
  categoryId: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: ['User', 'Entity'] }] })
  helpedUserId: Types.ObjectId[];

  @Prop({ default: Date.now })
  creationDate: Date;

  @Prop()
  finishedDate?: Date;

  @Prop({ default: true })
  active: boolean;

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: false,
    },
  })
  location?: {
    type: string;
    coordinates: number[];
  };

  @Prop({ default: 1, unique: true })
  index: number;
}

export const HelpOfferSchema = SchemaFactory.createForClass(HelpOffer);

// Virtual fields
HelpOfferSchema.virtual('user', {
  ref: 'User',
  localField: 'ownerId',
  foreignField: '_id',
  justOne: true,
});

HelpOfferSchema.virtual('categories', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
});

HelpOfferSchema.virtual('helpedUsers', {
  refPath: 'helpedUserType',
  localField: 'helpedUserId',
  foreignField: '_id',
});

HelpOfferSchema.virtual('distances')
 .set(function({ userCoords, coords }) {
   const userLocation = {
     longitude: userCoords[0],
     latitude: userCoords[1],
   };
   const coordinates = {
     longitude: coords[0],
     latitude: coords[1],
   };
   (this as any).distanceValue = calculateDistance(coordinates, userLocation);
   (this as any).distance = getDistance(coordinates, userLocation);
 });

HelpOfferSchema.virtual('distanceValue')
.get(function () {
  return (this as any)._distanceValue || null;
});

HelpOfferSchema.virtual('distance')
  .get(function () {
    return (this as any)._distance || null;
  });

HelpOfferSchema.virtual('type').get(function() {
  return 'offer';
});

HelpOfferSchema.set('toObject', { virtuals: true });
HelpOfferSchema.set('toJSON', { virtuals: true }); 
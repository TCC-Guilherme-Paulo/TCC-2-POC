import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { calculateDistance, getDistance } from 'src/utils/geolocation/calculateDistance';

export enum HelpStatusEnum {
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished',
  CANCELLED = 'cancelled',
}

@Schema({ collection: 'campaign', timestamps: true })
export class Campaign extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, maxlength: 500 })
  description: string;

  @Prop({ 
    type: String, 
    enum: Object.values(HelpStatusEnum), 
    default: HelpStatusEnum.WAITING 
  })
  status: HelpStatusEnum;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Category' }] })
  categoryId: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  helperId?: Types.ObjectId;

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

export const CampaignSchema = SchemaFactory.createForClass(Campaign);

// Virtual fields
CampaignSchema.virtual('categories', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
});

CampaignSchema.virtual('entity', {
  ref: 'Entity',
  localField: 'ownerId',
  foreignField: '_id',
  justOne: true,
});

CampaignSchema.virtual('distances')
  .set(function({ campaignCoords, coords }: { campaignCoords: number[], coords: number[] }) {
    const campaignCoordsObj = {
      longitude: campaignCoords[0],
      latitude: campaignCoords[1],
    };
    const coordinates = {
      longitude: coords[0],
      latitude: coords[1],
    };
    (this as any).distanceValue = calculateDistance(coordinates, campaignCoordsObj);
    (this as any).distance = getDistance(coordinates, campaignCoordsObj);
  });

CampaignSchema.virtual('distanceValue')
  .get(function() {
    return (this as any)._distanceValue || null;
  });

CampaignSchema.virtual('distance')
  .get(function() {
    return (this as any)._distance || null;
  });

CampaignSchema.virtual('type').get(function() {
  return 'campaign';
});

// Enable virtuals
CampaignSchema.set('toObject', { virtuals: true });
CampaignSchema.set('toJSON', { virtuals: true }); 
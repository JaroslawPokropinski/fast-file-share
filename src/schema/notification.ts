import { Field, ID, InputType, ObjectType } from 'type-graphql';

@ObjectType('Notification')
export class Notification {
  @Field(() => ID)
  id!: string;

  @Field()
  fileName!: string;

  @Field()
  magnet!: string;

  @Field()
  infoHash!: string;
}

@InputType()
export class NotificationInput implements Omit<Notification, 'id'> {
  @Field()
  fileName!: string;

  @Field()
  magnet!: string;

  @Field()
  infoHash!: string;
}

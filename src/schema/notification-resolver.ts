import {
  Arg,
  Ctx,
  ID,
  Mutation,
  PubSub,
  PubSubEngine,
  Query,
  Resolver,
  Root,
  Subscription,
} from 'type-graphql';
import { Service } from 'typedi';
import { Notification, NotificationInput } from './notification.js';
import { v4 as uuidv4 } from 'uuid';
import { ContextType } from '../context.js';
import { PeerServer } from '../createPeerServer.js';

@Service()
@Resolver(Notification)
export class NotificationResolver {
  notificationsCollection = new Map<string, Notification[]>();

  constructor(public peerServer: PeerServer) {}

  @Query(() => [Notification])
  notifications(@Ctx() ctx: ContextType) {
    const userNotifications =
      this.notificationsCollection.get(ctx.loggedInUser!) ?? [];
    // remove disconnected torrents
    const filteredNotifications = userNotifications.filter((notification) => {
      const torrent = this.peerServer.instance.torrents[notification.infoHash];
      return torrent && torrent.complete > 0;
    });

    this.notificationsCollection.set(ctx.loggedInUser!, filteredNotifications);
    return filteredNotifications;
  }

  @Mutation(() => Notification)
  async sendNotification(
    @Arg('notification') notification: NotificationInput,
    @Ctx() ctx: ContextType,
    @PubSub() pubSub: PubSubEngine
  ): Promise<Notification> {
    const newNotification = { ...notification, id: uuidv4() };
    const notifications =
      this.notificationsCollection.get(ctx.loggedInUser!) ?? [];

    notifications.push(newNotification);

    this.notificationsCollection.set(ctx.loggedInUser!, notifications);
    await pubSub.publish('NEW_NOTIFICATION', newNotification);

    return newNotification;
  }

  @Mutation(() => Notification)
  async removeNotification(
    @Arg('notificationsIds', () => [ID]) notificationsIds: string[],
    @Ctx() ctx: ContextType,
    @PubSub() pubSub: PubSubEngine
  ): Promise<Notification[]> {
    const notifications =
      this.notificationsCollection.get(ctx.loggedInUser!) ?? [];

    notifications.filter(
      (notification) => !notificationsIds.includes(notification.id)
    );

    this.notificationsCollection.set(ctx.loggedInUser!, notifications);
    await pubSub.publish('REMOVE_NOTIFICATION', undefined);

    return notifications;
  }

  @Subscription({
    topics: 'NEW_NOTIFICATION',
    filter: ({ payload, args }) => args.userId === payload.userId,
  })
  newNotification(@Root() notification: Notification): Notification {
    return notification;
  }
}

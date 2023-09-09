import { gql, useMutation, useSuspenseQuery } from '@apollo/client';
import { useEffect } from 'react';

export type Notification = {
  id: string;
  fileName: string;
  magnet: string;
  infoHash: string;
};

export type NotificationInput = Omit<Notification, 'id'>;

export const NOTIFICATIONS_SUBSCRIPTION = gql`
  subscription NewNotification {
    newNotification {
      id
      fileName
      magnet
    }
  }
`;

export const NOTIFICATIONS_QUERY = gql`
  query Notifications {
    notifications {
      id
      fileName
      magnet
    }
  }
`;

export const CREATE_NOTIFICATION = gql`
  mutation Mutation($notification: NotificationInput!) {
    sendNotification(notification: $notification) {
      id
    }
  }
`;

export const useNotifications = (userId: string) => {
  const { subscribeToMore, ...queryRest } = useSuspenseQuery<{
    notifications: Notification[];
  }>(NOTIFICATIONS_QUERY, {
    variables: { userId },
  });

  useEffect(() => {
    const cleanup = subscribeToMore<{
      newNotification: Notification;
    }>({
      document: NOTIFICATIONS_SUBSCRIPTION,
      variables: { userId: 'user' },
      updateQuery: (prev, { subscriptionData }) => {
        console.log(prev, subscriptionData);
        return {
          notifications: [
            ...prev.notifications,
            subscriptionData.data.newNotification,
          ],
        };
      },
    });

    return cleanup;
  }, [subscribeToMore]);

  return { ...queryRest };
};

export const useCreateNotification = () => {
  return useMutation<
    Notification,
    { notification: NotificationInput; userId: string }
  >(CREATE_NOTIFICATION);
};

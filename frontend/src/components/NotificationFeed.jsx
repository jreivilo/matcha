import WebSocket from 'ws';

const NotificationCard = ({ notification, user }) => {
  const { displayUser } = user;
  const isSelf = user.username === notification.username;
  const isLiked = displayUser.liked_by?.includes(notification.username);
  const isBlocked = displayUser.blocked_by?.includes(notification.username);
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          {notification.username === user.username ? (
            <img src={user.picture_path} alt={user.username} className="w-12 h-12 rounded-full" />
          ) : (
            <img src={displayUser.picture_path} alt={displayUser.username} className="w-12 h-12 rounded-full" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-text-light">{notification.username}</p>
            {isSelf && <p className="text-sm text-text-light">You</p>}
          </div>
          <p className="text-sm text-text-light">{notification.message}</p>
        </div>
        <div className="flex items-center space-x-2">
          {isLiked && (
            <Button variant="outline" className="text-text-light">
              <ThumbsUp className="mr-2 h-4 w-4" /> Liked
            </Button>
          )}
          {isBlocked && (
            <Button variant="outline" className="text-text-light">  
              <UserX className="mr-2 h-4 w-4" /> Blocked
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export const NotificationFeed = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000');

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'IDENTIFY', userId: user.id }));
      console.log('Connected to the WebSocket');
    };

    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      if (notification.type === 'NEW_NOTIFICATION') {
        setNotifications((prevNotifications) => [...prevNotifications, notification]);
      } else if (notification.type === 'UPDATE_NOTIFICATION') {
        setNotifications((prevNotifications) => prevNotifications.map((notification) => {
          if (notification.id === notification.id) {
            return { ...notification, read_status: notification.read_status === 'UNREAD' ? 'READ' : 'UNREAD' };
          }
          return notification;
        }));
      }
    };


    ws.onerror = (event) => {
      console.log(`Error occurred: ${event}`);
    };

    ws.onclose = () => {
      console.log('Disconnected from the WebSocket');
    };

    return () => {
      ws.close();
    };  
  }, []);

  useEffect(() => {
    setIsLoading(false);
  }, [notifications]);

  return (
    <div className="flex flex-col items-center space-y-4">
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} user={user} />
          ))}
        </div>
      )}
    </div>
  );
};  
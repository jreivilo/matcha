import NotificationCard from '@/components/notif/NotificationCard';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from '@/components/ui/button'

const NotificationFeed = ({ unreadCount, notifications, handleMarkAllAsRead}) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="relative">
          Notifications
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 bg-gray-800 text-white">
        <div className="flex justify-between items-center mb-2 p-2">
          <h3 className="font-semibold">Notifications</h3>
          <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
            Mark All as Read
          </Button>
        </div>
        <ScrollArea className="h-[300px]">
          {notifications && notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))
          ) : (
            <p className="text-center text-gray-400">No notifications</p>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
)

export default NotificationFeed
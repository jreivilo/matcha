import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleLike, toggleBlock } from '@/api.js';
import { Button } from "@/components/ui/button";
import { ThumbsUp, UserX, AlertTriangle } from "lucide-react";
import { useUserData } from '@/hooks/useUserData';

export const InteractionMenu = ({ profileUsername, user }) => {
    const queryClient = useQueryClient();

    const { data: userInfo, isLoading, error } = useUserData(profileUsername);

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    const { displayUser, isLiked, isBlocked } = userInfo ?? {};
    const hasPics = displayUser?.pics?.length > 0;

    const likeMutation = useMutation({
        mutationFn: toggleLike,
        onMutate: async ({ profileUsername, viewer, isLiked }) => {
        await queryClient.cancelQueries(['userData', profileUsername, viewer]);
        const previousUserInfo = queryClient.getQueryData(['userData', profileUsername, viewer]);
        queryClient.setQueryData(['userData', profileUsername, viewer], old => ({
            ...old,
            isLiked: !isLiked
        }));
        return { previousUserInfo };
        },
        onError: (err, variables, context) => {
        queryClient.setQueryData(['userData', variables.profileUsername, variables.viewer], context.previousUserInfo);
        },
        onSettled: (data, error, { profileUsername, viewer }) => {
        queryClient.invalidateQueries(['userData', profileUsername, viewer]);
        }
    });

    const blockMutation = useMutation({
        mutationFn: toggleBlock,
        onMutate: async ({ profileUsername, viewer, isBlocked }) => {
        await queryClient.cancelQueries(['userData', profileUsername, viewer]);
        const previousUserInfo = queryClient.getQueryData(['userData', profileUsername, viewer]);
        queryClient.setQueryData(['userData', profileUsername, viewer], old => ({
            ...old,
            isBlocked: !isBlocked,
            isLiked: !isBlocked ? false : old.isLiked // Unlike if blocking
        }));
        return { previousUserInfo };
        },
        onError: (err, variables, context) => {
        queryClient.setQueryData(['userData', variables.profileUsername, variables.viewer], context.previousUserInfo);
        },
        onSettled: (data, error, { profileUsername, viewer }) => {
        queryClient.invalidateQueries(['userData', profileUsername, viewer]);
        }
    });

    const handleLike = () => {
        if (user && profileUsername && (user?.username != profileUsername)) {
        likeMutation.mutate({ profileUsername, viewer: user?.username, isLiked: userInfo.isLiked });
        }
    };
    
    const handleBlock = () => {
        if (user && profileUsername && (user?.username != profileUsername)) {
        blockMutation.mutate({ profileUsername, viewer: user.username, isBlocked: userInfo.isBlocked });  
        }
    };

    const handleReport = () => {
        alert("This user has been reported!!");
    }

    return (
        <div className="flex justify-between mt-4">
            <Button onClick={handleLike}
                variant={isLiked ? "default" : "outline"}
                disabled={isBlocked || !hasPics}
            >
                <ThumbsUp className="mr-2 h-4 w-4" /> {isLiked ? 'Unlike' : 'Like'}
            </Button>
            <Button onClick={handleBlock}
                variant={isBlocked ? "default" : "outline"}
            >
                <UserX className="mr-2 h-4 w-4" /> {isBlocked ? 'Unblock' : 'Block'}
            </Button>
            <Button onClick={handleReport} variant="outline">
                <AlertTriangle className="mr-2 h-4 w-4" /> Report
            </Button>
        </div>
    )
}
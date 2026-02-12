<?php

namespace App\Services;

use App\Models\{Post, Share};
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;

class DashboardService
{
    public function getGlobalFeed(array $userIds, int $perPage = 5): LengthAwarePaginator
    {
        $skeleton = $this->getFeedSkeleton($userIds, $perPage);

        $items = $this->hydrateModels($skeleton->getCollection());

        return $skeleton->setCollection($items);
    }

    private function getFeedSkeleton(array $userIds, int $perPage)
    {
        $posts = DB::table('posts')
            ->select('id', DB::raw("'post' as type"), 'created_at as sort_date')
            ->whereIn('user_id', $userIds)
            ->whereNull('deleted_at');

        $shares = DB::table('shares')
            ->select('id', DB::raw("'share' as type"), 'updated_at as sort_date')
            ->whereIn('user_id', $userIds);

        return $posts->unionAll($shares)
            ->orderByDesc('sort_date')
            ->paginate($perPage);
    }

    private function hydrateModels($items)
    {
        $grouped = $items->groupBy('type');

        $posts = Post::with(['user'])->withMetadata()
            ->whereIn('id', $grouped->get('post', collect())->pluck('id'))
            ->get()->keyBy('id');

        $shares = Share::with(['user', 'post.user', 'post' => fn($q) => $q->withMetadata()])
            ->whereIn('id', $grouped->get('share', collect())->pluck('id'))
            ->get()->keyBy('id');

        return $items->map(function ($item) use ($posts, $shares) {
            $model = ($item->type === 'post') ? $posts->get($item->id) : $shares->get($item->id);
            
            if ($model) {
                return [
                    'type' => $item->type,
                    'id'   => $item->id,
                    'data' => $model
                ];
            }
            return null;
        })->filter()->values();
    }
}

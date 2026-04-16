import { useEffect, useState } from "react"
import { GripVertical, Pencil, Trash2, Video } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { toast } from "sonner"
import { useReorderCourseVideos } from "@/hooks/useCourseVideos"
import { VIDEO_TAG_OPTIONS } from "@/lib/videoTags"
import type { CourseVideo } from "@/types"

interface SortableVideoItemProps {
  video: CourseVideo
  onEdit: (v: CourseVideo) => void
  onDelete: (id: number) => void
}

function SortableVideoItem({ video, onEdit, onDelete }: SortableVideoItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: video.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: isDragging ? "#1a1a24" : "#0a0a0f",
    boxShadow: isDragging
      ? "0 10px 30px -5px rgba(0,0,0,0.5), 0 0 0 1px rgba(167,139,250,0.25)"
      : undefined,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.95 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-white/5"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab touch-none rounded p-1 text-gray-500 transition-colors hover:bg-white/5 hover:text-purple-300 active:cursor-grabbing"
        aria-label="Arrastar para reordenar"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <Video className="h-4 w-4 text-purple-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{video.title}</p>
        <p className="text-xs text-gray-500 truncate">{video.video_url ?? "Sem link"}</p>
      </div>
      <span
        className="flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase"
        style={{ backgroundColor: "#6d28d915", color: "#a78bfa" }}
      >
        {VIDEO_TAG_OPTIONS.find((t) => t.value === video.tag)?.label ?? video.tag}
      </span>
      <button
        onClick={() => onEdit(video)}
        className="flex-shrink-0 rounded p-1.5 text-gray-500 hover:bg-white/5 hover:text-white"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => onDelete(video.id)}
        className="flex-shrink-0 rounded p-1.5 text-gray-500 hover:bg-red-500/10 hover:text-red-400"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

interface SortableVideoListProps {
  videos: CourseVideo[]
  courseId: number
  onEdit: (v: CourseVideo) => void
  onDelete: (id: number) => void
}

export default function SortableVideoList({
  videos,
  courseId,
  onEdit,
  onDelete,
}: SortableVideoListProps) {
  const reorder = useReorderCourseVideos(courseId)
  const [items, setItems] = useState<CourseVideo[]>(videos)

  useEffect(() => {
    setItems(videos)
  }, [videos])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((v) => v.id === active.id)
    const newIndex = items.findIndex((v) => v.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const newItems = arrayMove(items, oldIndex, newIndex)
    setItems(newItems)

    reorder.mutate(
      newItems.map((v) => v.id),
      {
        onError: () => {
          toast.error("Erro ao reordenar.")
          setItems(videos)
        },
      },
    )
  }

  return (
    <div
      className="space-y-2 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden"
      style={{ maxHeight: "520px", scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((v) => v.id)} strategy={verticalListSortingStrategy}>
          {items.map((v) => (
            <SortableVideoItem key={v.id} video={v} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}

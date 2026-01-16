-- Migration to add answer image and resource ordering
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS answer_image_path text;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS order_index int DEFAULT 0;

-- Optional: Comments
COMMENT ON COLUMN public.questions.answer_image_path IS 'Path to the image for the question answer';
COMMENT ON COLUMN public.resources.order_index IS 'Used for manual sorting of resources';

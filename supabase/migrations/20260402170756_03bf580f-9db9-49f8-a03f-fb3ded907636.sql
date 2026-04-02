ALTER TABLE public.professionals
  ADD COLUMN cover_photo_focus_x SMALLINT NOT NULL DEFAULT 50,
  ADD COLUMN cover_photo_focus_y SMALLINT NOT NULL DEFAULT 50;
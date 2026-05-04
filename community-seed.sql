-- ============================================================
-- SEED DATA: ARTISAN SPOTLIGHTS
-- ============================================================

-- First, ensure there is an artisan profile to link to.
-- If you don't have an artisan user, this script might fail or need a real UUID.
-- This script uses a subquery to find the first artisan in the system.

DO $$
DECLARE
    artisan_uuid UUID;
BEGIN
    SELECT id INTO artisan_uuid FROM public.profiles WHERE is_artisan = true LIMIT 1;

    IF artisan_uuid IS NOT NULL THEN
        -- Insert a sample spotlight
        INSERT INTO public.artisan_spotlights (
            artisan_id,
            title,
            content,
            cover_image,
            interview_json
        ) VALUES (
            artisan_uuid,
            'The Soul of Minimalism: A Dialogue with Form',
            'In the quiet suburbs of Kyoto, we found a studio that feels more like a sanctuary. Here, the air is thick with the scent of wet earth and the steady hum of a potter’s wheel. This is the world of Atelier’s featured artisan, where every curve tells a story of patience and every glaze is a reflection of the seasons.',
            'https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=1600&auto=format&fit=crop',
            '{
                "questions": [
                    {
                        "question": "What inspired you to begin working with clay?",
                        "answer": "It was the tactile nature of it. In a world that is increasingly digital, I felt a deep need to touch something real, something that comes from the ground. Clay has a memory; it records every touch, every breath."
                    },
                    {
                        "question": "How do you handle the imperfections in your work?",
                        "answer": "I don''t handle them; I celebrate them. Wabi-sabi is the core of my philosophy. The crack in the glaze or the slight wobble in the rim is where the soul of the piece lives. Perfection is sterile; imperfection is human."
                    },
                    {
                        "question": "What does a typical day in your studio look like?",
                        "answer": "I start with tea. Then I spend an hour just looking at the work from the previous day. I don''t start the wheel until my mind is quiet. Sometimes that takes five minutes, sometimes five hours."
                    }
                ]
            }'::jsonb
        );

        -- Insert some sample community posts
        INSERT INTO public.community_posts (
            user_id,
            image_url,
            caption
        ) VALUES 
        (artisan_uuid, 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=800', 'Sunday morning rituals with my favorite mug.'),
        (artisan_uuid, 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800', 'Finally found the perfect centerpiece for the dining table.'),
        (artisan_uuid, 'https://images.unsplash.com/photo-1594913366159-1832ffefc511?q=80&w=800', 'The textures in this piece are incredible up close.');
        
        RAISE NOTICE 'Seed data successfully inserted for artisan: %', artisan_uuid;
    ELSE
        RAISE NOTICE 'No artisan profile found. Please mark a user as is_artisan = true first.';
    END IF;
END $$;

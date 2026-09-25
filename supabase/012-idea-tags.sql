-- Topic tags for the forum-era ideas, so they fall into real channels on /rrjeti/postimet/
-- (each tag is a channel) instead of the four old categories that 009-tags.sql copies over.
-- Run once in the Supabase SQL Editor, after 009-tags.sql. Safe to re-run: an idea whose
-- tags were already edited (more than the one migrated category) is left alone.

update ideas set tags = v.tags
from (values
  (1,  array['Tech', 'Evente']),
  (2,  array['Gjuha shqipe', 'Komuniteti']),
  (3,  array['Komuniteti']),
  (4,  array['Karriera', 'Berlin']),
  (5,  array['Berlin', 'Evente']),
  (6,  array['Gjuha shqipe', 'Itali', 'Akademia']),
  (7,  array['Tech', 'Siguria']),
  (8,  array['Shëndeti']),
  (9,  array['Tech', 'Evente']),
  (22, array['Evente']),
  (23, array['Evente', 'Karriera']),
  (24, array['Tech', 'Komuniteti']),
  (25, array['Tech', 'Siguria']),
  (26, array['Evente', 'Vjenë']),
  (27, array['Evente', 'Financa', 'Gjermani']),
  (28, array['AI', 'Tech']),
  (29, array['Evente', 'Karriera']),
  (30, array['Shëndeti', 'Itali', 'Evente']),
  (31, array['Itali', 'Komuniteti']),
  (32, array['Tech', 'Siguria', 'Evente']),
  (33, array['Tech', 'Komuniteti']),
  (34, array['Punë', 'Tech', 'Itali']),
  (35, array['Evente']),
  (36, array['AI', 'Ligji']),
  (37, array['Punë', 'Itali']),
  (38, array['AI']),
  (39, array['Akademia', 'Komuniteti']),
  (40, array['Komuniteti']),
  (41, array['Akademia']),
  (42, array['Akademia', 'Evente']),
  (43, array['AI', 'Evente']),
  (44, array['Gjuha shqipe']),
  (45, array['Gjuha shqipe']),
  (46, array['Gjuha shqipe', 'Evente']),
  (47, array['AI', 'Marketing']),
  (48, array['Gjuha shqipe']),
  (49, array['Akademia']),
  (50, array['Karriera', 'Evente']),
  (51, array['Shëndeti', 'Akademia'])
) as v(id, tags)
where ideas.id = v.id and cardinality(ideas.tags) <= 1;

UPDATE agent_team_members
SET slug = lower(
  trim(BOTH '-' FROM
    regexp_replace(
      translate(name, 'áéíóúñüÁÉÍÓÚÑÜàèìòùÀÈÌÒÙâêîôûÂÊÎÔÛäëïöÄËÏÖ', 'aeiounuAEIOUNUaeiouAEIOUaeiouAEIOUaeioAEIO'),
      '[^a-zA-Z0-9]+', '-', 'g'
    )
  )
)
WHERE slug IS NULL;
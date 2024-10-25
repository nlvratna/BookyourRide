
--@param {String} $1:location The required location
SELECT c.*
FROM "Car" c
JOIN "Owner" o ON c."ownerId" = o.id
WHERE o.location= $1

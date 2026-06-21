const fs = require('fs');
const file = 'src/app/page.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  '{dest.visit_info.estimated_price.toLocaleString(\'id-ID\')}', 
  '{Number(dest.visit_info?.estimated_price || 0).toLocaleString(\'id-ID\')}'
);
content = content.replace(
  '{dest.categories.join(", ")}',
  '{(dest.categories || []).join(", ")}'
);
content = content.replace(
  '<Star className="w-3 h-3 fill-current mr-1" />{dest.rating_and_reviews.average_rating}',
  '<Star className="w-3 h-3 fill-current mr-1" />{dest.rating_and_reviews?.average_rating || 0}'
);
content = content.replace(
  '<Star className="w-3.5 h-3.5 text-yellow-500 fill-current" /> {dest.rating_and_reviews.average_rating}',
  '<Star className="w-3.5 h-3.5 text-yellow-500 fill-current" /> {dest.rating_and_reviews?.average_rating || 0}'
);
content = content.replace(
  '<Star className="w-3 h-3 fill-current mr-0.5" />{dest.rating_and_reviews.average_rating}',
  '<Star className="w-3 h-3 fill-current mr-0.5" />{dest.rating_and_reviews?.average_rating || 0}'
);
content = content.replace(
  '({dest.rating_and_reviews.total_reviews} ulasan)',
  '({dest.rating_and_reviews?.total_reviews || 0} ulasan)'
);
content = content.replace(
  '{dest.categories[0]} • 1.2km',
  '{dest.categories?.[0] || "Umum"} • 1.2km'
);
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed page.tsx');

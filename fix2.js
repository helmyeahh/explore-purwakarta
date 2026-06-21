const fs = require('fs');
const file = 'src/app/page.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  '{categoryIcons[dest.categories[0]] && React.createElement(categoryIcons[dest.categories[0]], { className: "w-3 h-3" })}\n                    {dest.categories[0]}',
  '{dest.categories?.[0] && categoryIcons[dest.categories[0]] && React.createElement(categoryIcons[dest.categories[0]], { className: "w-3 h-3" })}\n                    {dest.categories?.[0] || "Umum"}'
);
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed page.tsx part 2');

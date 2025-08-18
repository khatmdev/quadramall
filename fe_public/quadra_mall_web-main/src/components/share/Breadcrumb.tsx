import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { mockData } from '@/data/mockData';
import { FaHome } from 'react-icons/fa'; // Icon cho "Trang Chủ"

interface BreadcrumbItem {
  to: string;
  name: string;
}

interface BreadcrumbMap {
  [key: string]: string;
}

const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Tạo ánh xạ slug với tên hiển thị từ mockData với kiểu rõ ràng
  const breadcrumbMap: BreadcrumbMap = {
    ...Object.fromEntries(mockData.products.map((p) => [p.slug, p.name])),
    ...Object.fromEntries(mockData.categories.map((c) => [c.slug, c.name])),
    ...Object.fromEntries(mockData.itemTypes.map((it) => [it.slug, it.name])),
    ...Object.fromEntries(mockData.stores.map((s) => [s.slug, s.name])),
    '': 'Trang Chủ',
  };

  // Xây dựng breadcrumb dựa trên route
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = pathnames.map((path, index) => {
      const to = `/${pathnames.slice(0, index + 1).join('/')}`;

      // Xử lý đặc biệt cho trang product
      if (path.startsWith('product') && index === pathnames.length - 1) {
        const slug = path.split('-')[1]; // Giả định slug là phần sau 'product-'
        const product = mockData.products.find((p) => p.slug === slug);
        if (product) {
          const category = mockData.categories.find((c) => c.id === product.category_id);
          const itemType = category && mockData.itemTypes.find((it) => it.id === category.item_type_id);

          if (itemType) breadcrumbs.push({ to: `/item-type/${itemType.slug}`, name: itemType.name });
          if (category) breadcrumbs.push({ to: `/category/${category.slug}`, name: category.name });
          return { to, name: product.name };
        }
      }

      return { to, name: breadcrumbMap[path] || path };
    });

    if (breadcrumbs.length > 0) {
      breadcrumbs.unshift({ to: '/', name: 'Trang Chủ' });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();
  const showBreadcrumb = location.pathname !== '/';

  return (
    showBreadcrumb && (
      <div className="container mx-auto px-4 py-2 pt-28">
        <ol className="flex space-x-4 text-black items-center">
          {breadcrumbs.map((crumb, index) => {
            const isCurrent = index === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.to}>
                <li className="flex items-center">
                  {index === 0 && <FaHome className="mr-1" />} {/* Icon trước "Trang Chủ" */}
                  <Link
                    to={crumb.to}
                    className={`hover:underline ${isCurrent ? 'text-green-600 font-bold' : ''}`}
                  >
                    {crumb.name}
                  </Link>
                </li>
                {index < breadcrumbs.length - 1 && <span className="mx-2">»</span>}
              </React.Fragment>
            );
          })}
        </ol>
      </div>
    )
  );
};

export default Breadcrumb;

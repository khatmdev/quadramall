import React from 'react';
import Card from '../components/Home/Card';

type BlogPost = {
  image: string;
  title: string;
  excerpt: string;
  date: string;
};

type BlogCardProps = {
  post: BlogPost;
};

const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  const { image, title, excerpt, date } = post;

  return (
    <Card className="h-full">
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-5">
        <p className="text-sm text-gray-500 mb-2">{date}</p>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 mb-4">{excerpt}</p>
        <a href="#" className="text-green-600 font-medium hover:text-green-700">
          Read More
        </a>
      </div>
    </Card>
  );
};

export default BlogCard;

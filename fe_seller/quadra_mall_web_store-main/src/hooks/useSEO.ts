import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setSEOData, SEOState } from '@/store/seoSlice';
import logo from'@/assets/quadramall_logo.png'

interface UseSEOProps {
    title: string;
    description: string;
    keywords?: string;
    ogImage?: string;
    ogType?: string;
}

export const useSEO = ({
                           title,
                           description,
                           keywords = '',
                           ogImage = logo,
                           ogType = 'website'
                       }: UseSEOProps) => {
    const dispatch = useDispatch();

    useEffect(() => {
        const currentUrl = window.location.href;

        dispatch(setSEOData({
            title,
            description,
            keywords,
            ogImage,
            ogType,
            canonicalUrl: currentUrl
        }));

    }, [dispatch, title, description, keywords, ogImage, ogType]);
};
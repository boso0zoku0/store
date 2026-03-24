import React, {useEffect, useState} from "react";
import axios from "axios";
import useFetchProducts from "./apiProducts.tsx";
import type {CartItem} from "../interfaces.tsx"


export default function Products() {
  const {products, loading} = useFetchProducts()

  if (loading) {
    return <div>Загрузка...</div>
  }
  if (!products || products.length === 0) return <div>Нет товаров</div>;

  return (
    <div>
      {products.map((item) => (
        <div key={item.Products.id}>
          <h3>ID: {item.Products.id}</h3>
          <h3>Название: {item.Products.name}</h3>
          <h3>Краткое название: {item.Products.shortName || '—'}</h3>
          <h3>Цена: {item.Products.price} ₽</h3>
          <h3>Количество: {item.quantity} шт</h3>

          {/* Описание */}
          <div>
            <p>Тип: {item.Products.description?.type}</p>
            <p>Цвет: {item.Products.description?.color}</p>
            <p>Объём: {item.Products.description?.volume}</p>
            <p>Диаметр: {item.Products.description?.diameter}</p>
            <p>Особенности: {item.Products.description?.specificity}</p>
          </div>

          {/* Фото */}
          {item.Products.photos && item.Products.photos.length > 0 ? (
            <img
              src={`http://localhost:8000/static/media/${item.Products.photos[0]}`}
              alt={item.Products.short_name || item.Products.name}
              style={{width: '200px'}}
              onError={(e) => {
                e.currentTarget.src = '/placeholder.jpg';
              }}
            />
          ) : (
            <div>Нет фото</div>
          )}

          <p>Описание: {item.Products.about?.substring(0, 100)}...</p>
          <hr />
        </div>
      ))}
    </div>
  );


}
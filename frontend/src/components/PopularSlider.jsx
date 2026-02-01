import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

export default function PopularSlider({ popular }) {
  return (
    <Swiper slidesPerView={2} spaceBetween={10}>
      {popular.map((p) => (
        <SwiperSlide key={p.id}>
          <div style={{
            borderRadius: 10,
            overflow: "hidden",
            height: 150
          }}>
            <img src={p.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

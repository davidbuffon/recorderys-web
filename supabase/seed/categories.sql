insert into public.categories (name, slug, description, icon, color, sort_order)
values
  ('Electrónica', 'electronica', 'Productos electrónicos de consumo.', 'device', '#27A9CF', 10),
  ('Electrodomésticos', 'electrodomesticos', 'Aparatos eléctricos para el hogar.', 'appliance', '#FFD31A', 20),
  ('Informática', 'informatica', 'Ordenadores, periféricos y accesorios informáticos.', 'laptop', '#4DA3FF', 30),
  ('Telefonía', 'telefonia', 'Teléfonos móviles y accesorios.', 'phone', '#3CC7B7', 40),
  ('Hogar', 'hogar', 'Artículos generales para casa.', 'home', '#8AD6E8', 50),
  ('Muebles', 'muebles', 'Mobiliario y decoración.', 'sofa', '#C7A27C', 60),
  ('Moda', 'moda', 'Ropa y complementos.', 'shirt', '#F58FA8', 70),
  ('Calzado', 'calzado', 'Zapatos, zapatillas y calzado general.', 'shoe', '#F4B942', 80),
  ('Deporte', 'deporte', 'Material y equipamiento deportivo.', 'activity', '#6DBF73', 90),
  ('Bebé', 'bebe', 'Productos para bebé y primera infancia.', 'baby', '#FFB7A1', 100),
  ('Juguetes', 'juguetes', 'Juguetes y juegos.', 'toy', '#F7CE68', 110),
  ('Herramientas', 'herramientas', 'Herramientas, bricolaje y mantenimiento.', 'tool', '#7E8A97', 120),
  ('Automoción', 'automocion', 'Productos para coche, moto y movilidad.', 'car', '#2F80ED', 130),
  ('Salud y cuidado personal', 'salud-cuidado-personal', 'Salud, belleza y cuidado personal.', 'heart', '#E66A6A', 140),
  ('Alimentación', 'alimentacion', 'Alimentos, bebidas y productos de supermercado.', 'basket', '#9ACD66', 150),
  ('Libros y papelería', 'libros-papeleria', 'Libros, material escolar y oficina.', 'book', '#B48CFF', 160),
  ('Mascotas', 'mascotas', 'Productos para animales de compañía.', 'paw', '#D8A15D', 170),
  ('Otros', 'otros', 'Categoría general cuando no hay suficiente información.', 'box', '#6C7A86', 999)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  color = excluded.color,
  sort_order = excluded.sort_order,
  is_active = true;

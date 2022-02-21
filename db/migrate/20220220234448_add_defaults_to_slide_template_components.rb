class AddDefaultsToSlideTemplateComponents < ActiveRecord::Migration[7.0]
  def change

   change_column :slide_template_components, :top, :integer, default: 0
   change_column :slide_template_components, :left, :integer, default: 0
   change_column :slide_template_components, :width, :integer, default: 200
   change_column :slide_template_components, :height, :integer, default: 30
   


  end
end

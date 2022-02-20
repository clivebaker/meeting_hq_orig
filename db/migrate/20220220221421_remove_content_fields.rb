class RemoveContentFields < ActiveRecord::Migration[7.0]
  def change


    remove_column :master_slide_templates, :content
    remove_column :components, :content
    add_column :master_slide_template_components, :content, :text
  end
end

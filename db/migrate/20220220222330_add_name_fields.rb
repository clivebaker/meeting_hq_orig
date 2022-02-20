class AddNameFields < ActiveRecord::Migration[7.0]
  def change

    add_column :master_slide_template_components, :name, :string

  end
end

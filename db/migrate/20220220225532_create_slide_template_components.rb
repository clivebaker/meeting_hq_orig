class CreateSlideTemplateComponents < ActiveRecord::Migration[7.0]
  def change
    create_table :slide_template_components do |t|
      t.references :slide_template, null: false, foreign_key: true
      t.references :component, null: false, foreign_key: true
      t.integer :top
      t.integer :left
      t.integer :width
      t.integer :height
      t.jsonb :settings
      t.text :content
      t.string :name

      t.timestamps
    end
  end
end

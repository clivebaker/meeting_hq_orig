class CreateSlides < ActiveRecord::Migration[7.0]
  def change
    create_table :slides do |t|
      t.references :meeting, null: false, foreign_key: true
      t.string :name
      t.references :slide_template, null: false, foreign_key: true
      t.boolean :enabled
      t.jsonb :data

      t.timestamps
    end
  end
end
